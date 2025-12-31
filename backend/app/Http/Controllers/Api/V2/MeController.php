<?php

namespace App\Http\Controllers\Api\V2;

use App\Http\Controllers\Controller;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use LaravelJsonApi\Core\Document\Error;
use LaravelJsonApi\Core\Responses\ErrorResponse;

class MeController extends Controller
{
    /**
     * @return JsonResponse
     */
    public function readProfile(Request $request)
    {
        $user = $request->user();

        if (! $user) {
            return ErrorResponse::make([Error::fromArray([
                'status' => 401,
                'title' => 'Unauthenticated',
                'detail' => 'User is not authenticated.',
            ])]);
        }

        $token = $user->token();

        $resource = [
            'data' => [
                'type' => 'users',
                'id' => (string) $user->getKey(),
                'attributes' => [
                    'name' => $user->name,
                    'email' => $user->email,
                    'profile_image' => $user->profile_image,
                    'roles' => $user->roles->pluck('name'),
                    'permissions' => $user->getAllPermissions()->pluck('name'),
                    'token_expires_at' => optional($token?->expires_at)->toISOString(),
                    'token_scopes' => $token?->scopes ?? [],
                    'created_at' => optional($user->created_at)->toISOString(),
                    'updated_at' => optional($user->updated_at)->toISOString(),
                ],
                'links' => [
                    'self' => route('v2.users.show', ['user' => $user->getKey()]),
                ],
            ],
        ];

        return response()->json($resource, 200, [
            'Content-Type' => 'application/vnd.api+json',
        ]);
    }

    /**
     * Update the specified resource.
     * Not named update because it conflicts with JsonApiController update method signature
     *
     * @return JsonResponse
     */
    public function updateProfile(Request $request)
    {
        $http = new Client(['verify' => config('app.verify_ssl', true)]);

        $headers = \App\Helpers\HttpHelper::parseHeaders($request->header());

        $input = $request->json()->all();

        $input['data']['id'] = (string) auth()->id();
        $input['data']['type'] = 'users';

        $data = [
            'headers' => $headers,
            'json' => $input,
            'query' => $request->query(),
        ];

        try {
            $response = $http->patch(route('v2.users.update', ['user' => auth()->id()]), $data);

        } catch (ClientException $e) {
            $errors = json_decode($e->getResponse()->getBody()->getContents(), true)['errors'];
            $errors = collect($errors)->map(function ($error) {
                return Error::fromArray($error);
            });

            return ErrorResponse::make($errors);
        }
        $responseBody = json_decode((string) $response->getBody(), true);
        $responseStatus = $response->getStatusCode();
        $responseHeaders = \App\Helpers\HttpHelper::parseHeaders($response->getHeaders());

        unset($responseHeaders['Transfer-Encoding']);

        return response()->json($responseBody, $responseStatus)->withHeaders($responseHeaders);
    }

}
