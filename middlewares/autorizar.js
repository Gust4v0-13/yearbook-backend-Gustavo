export default function autorizar(...rolesPermitidos) {
  return function (req, res, next) {
    if (!rolesPermitidos.includes(req.artista.role)) {
      return res.status(403).json({ erro: "Acesso negado" });
    }
    next();
  };
}