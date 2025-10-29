// Vercel serverless function for health check
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    service: 'AISim Nursing Assistant',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}
