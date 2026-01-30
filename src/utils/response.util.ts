import { Response } from "express";

export class ResponseUtil {
  static success(res: Response, message: string, data?: any) {
    return res.status(200).json({
      success: true,
      message,
      data,
    });
  }

  static created(res: Response, message: string, data?: any) {
    return res.status(201).json({
      success: true,
      message,
      data,
    });
  }

  static error(
    res: Response,
    message: string,
    statusCode: number = 400,
    errors?: any,
  ) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors,
    });
  }

  static paginated(
    res: Response,
    message: string,
    data: any[],
    page: number,
    limit: number,
    total: number,
  ) {
    return res.status(200).json({
      success: true,
      message,
      data,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  }
}
