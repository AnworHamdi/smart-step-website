# Contributing to Laravel Headless CMS

Thank you for considering contributing to this project! This document provides guidelines for contributing.

## 🤝 How to Contribute

### Reporting Bugs

If you find a bug, please create an issue with:
- Clear title and description
- Steps to reproduce
- Expected vs actual behavior
- PHP and Laravel versions
- Any relevant logs or error messages

### Suggesting Features

Feature requests are welcome! Please:
- Check if the feature has already been requested
- Provide a clear use case
- Explain how it benefits the project
- Consider implementation complexity

### Pull Requests

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/AmazingFeature`)
3. **Make your changes**
4. **Add tests** for new functionality
5. **Update documentation** if needed
6. **Run tests** (`php artisan test`)
7. **Run code style** (`./vendor/bin/pint`)
8. **Commit your changes** with clear messages
9. **Push to your fork** (`git push origin feature/AmazingFeature`)
10. **Open a Pull Request**

## 📝 Code Standards

### PHP Code Style

- Follow **PSR-12** coding standards
- Use **Laravel Pint** for formatting: `./vendor/bin/pint`
- Use type hints for parameters and return types
- Add PHPDoc blocks for classes and methods

### Naming Conventions

- Controllers: `PascalCase` ending with `Controller`
- Models: `PascalCase` (singular)
- Methods: `camelCase`
- Variables: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Database tables: `snake_case` (plural)

### Testing

- Write tests for all new features
- Maintain or improve code coverage
- Use descriptive test names
- Follow Arrange-Act-Assert pattern

```php
/** @test */
public function user_can_create_item_with_category()
{
    // Arrange
    $user = $this->actingAsCreator();
    $category = Category::factory()->create();
    
    // Act
    $response = $this->postJson('/api/v2/items', [
        // ...
    ]);
    
    // Assert
    $response->assertStatus(201);
    $this->assertDatabaseHas('items', ['name' => 'Test']);
}
```

## 🔍 Review Process

1. All PRs are reviewed by maintainers
2. CI/CD checks must  pass
3. At least one approval required
4. Conflicts must be resolved
5. Squash and merge preferred

## 🌟 Good First Issues

Look for issues labeled `good first issue` for beginner-friendly contributions.

## 📜 License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 💬 Questions?

Feel free to open a discussion or reach out to maintainers!
