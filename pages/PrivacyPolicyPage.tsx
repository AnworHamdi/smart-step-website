import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { useSeo } from '../hooks/useSeo';

const PrivacyPolicyPage: React.FC = () => {
    const { language } = useTranslation();
    useSeo(
        language === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy',
        language === 'ar' ? 'سياسة الخصوصية لشركة الخطوة الذكية' : 'Privacy Policy for Smart Step'
    );

    return (
        <div className="py-20 bg-gray-50 dark:bg-zinc-900 min-h-screen transition-colors duration-300">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 md:p-12">
                    {language === 'ar' ? (
                        <>
                            <h1 className="text-3xl md:text-4xl font-bold text-smart-blue dark:text-soft-blue mb-6">
                                سياسة الخصوصية
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">آخر تحديث: 1/1/2026</p>

                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                تلتزم شركة "خطوات ذكية" (المشار إليها بـ "نحن" أو "لنا") بحماية خصوصيتك. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك عند زيارة موقعنا الإلكتروني https://smartstep.ly واستخدام خدماتنا.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">1. المعلومات التي نجمعها</h2>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                                <li><strong>البيانات الشخصية:</strong> الاسم، بريد الإلكتروني، ورقم الهاتف المقدم عبر نماذج الاتصال.</li>
                                <li><strong>بيانات الاستخدام:</strong> عناوين IP، نوع المتصفح، والصفحات التي تمت زيارتها لتحسين تجربة المستخدم.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">2. كيف نستخدم معلوماتك</h2>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                                <li>لتقديم خدماتنا وصيانتها.</li>
                                <li>للتواصل معك بخصوص الاستفسارات أو المشاريع.</li>
                                <li>لتحسين وظائف الموقع وأمنه.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">3. مشاركة البيانات</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                نحن لا نبيع بياناتك الشخصية. قد نشارك المعلومات مع مزودي خدمة خارجيين (مثل شركات الاستضافة) الذين يساعدوننا في تشغيل موقعنا، بشرط التزامهم بالسرية.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">4. أمن البيانات</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                نطبق معايير أمنية متقدمة لحماية بياناتك. ومع ذلك، لا توجد وسيلة نقل عبر الإنترنت آمنة بنسبة 100%.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">5. حقوقك</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                لديك الحق في طلب الوصول إلى بياناتك الشخصية التي نحتفظ بها، أو تصحيحها، أو طلب حذفها.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">معلومات التواصل</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">إذا كان لديك أي استفسار، يرجى التواصل معنا عبر:</p>
                            <p className="text-gray-700 dark:text-gray-300">البريد الالكتروني: <a href="mailto:info@smartstep.ly" className="text-smart-blue dark:text-soft-blue hover:underline">info@smartstep.ly</a></p>
                            <p className="text-gray-700 dark:text-gray-300">العنوان: طرابلس، ليبيا</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-3xl md:text-4xl font-bold text-smart-blue dark:text-soft-blue mb-6">
                                Privacy Policy
                            </h1>
                            <p className="text-gray-500 dark:text-gray-400 mb-8">Last Updated: 1/1/2026</p>

                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                Smart Step ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website https://smartstep.ly and use our services.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">1. Information We Collect</h2>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                                <li><strong>Personal Data:</strong> Name, email address, and phone number provided via contact forms.</li>
                                <li><strong>Usage Data:</strong> IP addresses, browser type, and pages visited to improve user experience.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">2. How We Use Your Information</h2>
                            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 mb-6 space-y-2">
                                <li>To provide and maintain our services.</li>
                                <li>To communicate with you regarding inquiries or projects.</li>
                                <li>To improve our website functionality and security.</li>
                            </ul>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">3. Data Sharing and Disclosure</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                We do not sell your personal data. We may share information with third-party service providers (like hosting) who assist us in operating our website, provided they maintain confidentiality.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">4. Data Security</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">5. Your Rights</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-6 leading-relaxed">
                                You have the right to request access to, correction of, or deletion of your personal data held by us.
                            </p>

                            <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4 mt-8">Contact Information</h2>
                            <p className="text-gray-700 dark:text-gray-300 mb-2">If you have any questions, please contact us at:</p>
                            <p className="text-gray-700 dark:text-gray-300">Email: <a href="mailto:info@smartstep.ly" className="text-smart-blue dark:text-soft-blue hover:underline">info@smartstep.ly</a></p>
                            <p className="text-gray-700 dark:text-gray-300">Address: Tripoli, Libya</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PrivacyPolicyPage;
