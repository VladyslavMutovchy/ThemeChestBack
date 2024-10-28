import jwt from 'jsonwebtoken';

export const apiHandler = async (req, res, action) => {
    if (typeof res.status !== 'function') {
      res.status = (code) => {
        res.statusCode = code;
        return res;
      };
    }
    if (typeof res.json !== 'function') {
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(data));
      };
    }
  
    try {
      const result = await action(req, res);
      res.status(200).json(result);
    } catch (error) {
      const errorMessage = error.error || 'Connection error';
      res.status(400).json({ error: errorMessage });
    }
  };
  

export const apiPublicWrapper = (action) => (req, res) => apiHandler(req, res, action);
export const apiPrivateWrapper = (action) => async (req, res) => {
  const token = req.headers['x-auth-token'];
  if (!token) return res.status(401).json({ error: 'Unauthorized access' });
  try {
    req.userId = jwt.verify(token, process.env.SECRET).id;
    await apiHandler(req, res, action);
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
};
