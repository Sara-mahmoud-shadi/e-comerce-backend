import { LanguageMiddleware } from './language.middleware';
import { Request, Response } from 'express';

describe('LanguageMiddleware', () => {
  let middleware: LanguageMiddleware;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: jest.Mock;

  beforeEach(() => {
    middleware = new LanguageMiddleware();
    mockRequest = {
      headers: {},
      query: {},
    };
    mockResponse = {
      setHeader: jest.fn(),
    };
    nextFunction = jest.fn();
  });

  it('should default to "ar" if no language headers or query params are provided', () => {
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('ar');
    expect(mockRequest['language']).toBe('ar');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'ar');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should ignore "lang: en" header by default and fallback to "ar" to handle default frontend Axios headers', () => {
    mockRequest.headers = { lang: 'en' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('ar');
    expect(mockRequest['language']).toBe('ar');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'ar');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should resolve "ar" from the "lang: ar" header', () => {
    mockRequest.headers = { lang: 'ar' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('ar');
    expect(mockRequest['language']).toBe('ar');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'ar');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should ignore "accept-language" header and default to "ar"', () => {
    mockRequest.headers = { 'accept-language': 'en-US,en;q=0.9' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('ar');
    expect(mockRequest['language']).toBe('ar');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'ar');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should resolve "en" if "lang=en" is explicitly passed in the query parameter', () => {
    mockRequest.query = { lang: 'en' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('en');
    expect(mockRequest['language']).toBe('en');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'en');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should normalize mixed casing (e.g. "EN") and trim whitespace in the query parameter', () => {
    mockRequest.query = { lang: '  EN  ' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('en');
    expect(mockRequest['language']).toBe('en');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should fallback to "ar" if an unsupported language (e.g. "fr") is provided in the query parameter', () => {
    mockRequest.query = { lang: 'fr' };
    middleware.use(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.headers?.['lang']).toBe('ar');
    expect(mockRequest['language']).toBe('ar');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('Content-Language', 'ar');
    expect(nextFunction).toHaveBeenCalled();
  });
});
