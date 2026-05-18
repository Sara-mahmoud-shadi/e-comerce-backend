import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LanguageMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    // 1. Check if the language is explicitly requested via query parameter (e.g. ?lang=en or ?lang=ar)
    let queryLang = req.query['lang'];
    if (Array.isArray(queryLang)) {
      queryLang = queryLang[0];
    }

    let resolvedLang = 'ar'; // Strict default fallback is Arabic ('ar')

    if (typeof queryLang === 'string') {
      const cleanQLang = queryLang.trim().toLowerCase();
      if (cleanQLang.startsWith('en')) {
        resolvedLang = 'en';
      } else if (cleanQLang.startsWith('ar')) {
        resolvedLang = 'ar';
      }
    } else {
      // 2. If no query parameter is provided, we check the 'lang' header.
      // Since the frontend request might automatically send 'lang: en' by default (due to Axios/browser setup),
      // we strictly default to 'ar' unless the header explicitly asks for 'ar'.
      let headerLang = req.headers['lang'];
      if (Array.isArray(headerLang)) {
        headerLang = headerLang[0];
      }

      if (typeof headerLang === 'string') {
        const cleanHLang = headerLang.trim().toLowerCase();
        if (cleanHLang.startsWith('ar')) {
          resolvedLang = 'ar';
        } else {
          // If the header is 'en' or anything else, we still default to 'ar'
          // to solve the issue where the frontend automatically sends 'lang: en'
          resolvedLang = 'ar';
        }
      }
    }

    // 3. Guarantee that the 'lang' request header contains the resolved value
    req.headers['lang'] = resolvedLang;

    // Attach to the request object directly for easy access and override nestjs-i18n's resolved language
    req['language'] = resolvedLang;
    req['i18nLang'] = resolvedLang;

    // 4. Set the Content-Language response header
    res.setHeader('Content-Language', resolvedLang);

    next();
  }
}
