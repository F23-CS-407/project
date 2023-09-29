export function auth_test(req, res, next) {
  if (req.isAuthenticated()) {
    res.status(200).send(req.user.username);
  } else {
    res.status(401).send('Not authenticated');
  }
}
