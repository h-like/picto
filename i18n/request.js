import {getRequestConfig} from 'next-intl/server';
 
export default getRequestConfig(async () => {
  const locale = 'ko'; // 임시 기본값
  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default
  };
});