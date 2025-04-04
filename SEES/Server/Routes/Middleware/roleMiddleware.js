// Role-based access control middleware

const restrictTo = (...roles) => {
    return (req, res, next) => {
      if (!req.user) {
        return res.status(401).json({ message: 'Not authenticated' });
      }
      
      if (!roles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: 'You do not have permission to perform this action' 
        });
      }
      
      next();
    };
  };
  
  module.exports = { restrictTo };