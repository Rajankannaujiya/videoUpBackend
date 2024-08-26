
import pako from 'pako'
import { Request, Response, NextFunction } from 'express';

export const decompressMiddleware = (req: Request, res: Response, next: NextFunction) => {
    try {
      const decompressedData = pako.inflate(req.body, { to: 'string' } as pako.InflateOptions & { to: 'string' });
      req.body = JSON.parse(decompressedData);
      console.log(req.body)
      next();
    } catch (error) {
      console.error('Decompression error:', error);
      res.status(400).json({ message: 'Error decompressing data' });
    }
  };


  // express.raw({ type: 'application/octet-stream', limit: '10mb' }),decompressMiddleware,