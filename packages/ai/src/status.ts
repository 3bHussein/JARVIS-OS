export function aiErrorMessage(code:string,ar:boolean){
 const values:Record<string,[string,string]>={
 ai_not_configured:['Cloud AI is not configured. Set the server model and Gateway authentication in Vercel.','الذكاء السحابي مش مُعدّ. محتاج موديل ومصادقة Gateway في إعدادات Vercel.'],
 ai_credentials_required:['Gateway authentication failed. Review the server credential; your JARVIS password is unrelated.','مصادقة Gateway فشلت. راجع إعداد السيرفر؛ باسورد جارفس مالوش علاقة.'],
 ai_budget_unavailable:['Gateway credits or budget are unavailable. Check usage/billing before retrying.','رصيد أو ميزانية Gateway غير متاحة. راجع الاستخدام والفوترة قبل المحاولة.'],
 ai_account_action_required:['The AI provider requires an account action. Review the Gateway dashboard.','مزود الذكاء محتاج إجراء في الحساب. راجع لوحة Gateway.'],
 ai_rate_limited:['AI request limit reached. Wait before retrying; the app also caps requests at 50 per day.','وصلت لحد طلبات الذكاء. استنى قبل المحاولة؛ التطبيق محدد كمان ٥٠ طلب في اليوم.'],
 ai_busy:['An AI request is already running. Wait for it to finish.','في طلب ذكاء شغّال بالفعل. استنى لما يخلص.'],
 ai_invalid_response:['The model did not return a complete usable answer. Your draft is kept.','الموديل مرجعش إجابة كاملة صالحة. مسودتك لسه موجودة.'],
 };
 return (values[code]??['AI connection failed or was cancelled. Your draft is kept. Check the provider configuration.','اتصال الذكاء فشل أو اتلغى. مسودتك لسه موجودة؛ راجع إعداد المزود.'])[ar?1:0];
}
