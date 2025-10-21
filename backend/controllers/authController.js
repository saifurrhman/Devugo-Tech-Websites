// OAuth handlers
exports.googleCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Redirect to frontend with success
    res.redirect('/login?success=true');
  } catch (err) {
    console.error('Google auth error:', err);
    res.redirect('/login?error=server_error');
  }
};

exports.linkedinCallback = async (req, res) => {
  try {
    if (!req.user) {
      return res.redirect('/login?error=auth_failed');
    }
    
    const accessToken = signAccess(req.user);
    const refreshToken = signRefresh(req.user);
    
    setAuthCookies(res, { accessToken, refreshToken });
    
    // Redirect to frontend with success
    res.redirect('/login?success=true');
  } catch (err) {
    console.error('LinkedIn auth error:', err);
    res.redirect('/login?error=server_error');
  }
};
