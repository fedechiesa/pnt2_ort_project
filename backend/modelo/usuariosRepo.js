import UsuariosModel from "./usuariosModel.js";

class UsuariosRepo {
  #usuarioModel = null;
  #ready = null;

  constructor() {
    this.#usuarioModel = UsuariosModel.init();
    this.#ready = UsuariosModel.sync();
  }

  #ensureReady = async () => {
    await this.#ready;
  };

  crear = async (usuario) => {
    await this.#ensureReady();
    const created = await this.#usuarioModel.create(usuario);
    return created.get({ plain: true });
  };

  buscarPorEmail = async (email) => {
    await this.#ensureReady();
    const usuario = await this.#usuarioModel.findOne({ where: { email } });
    return usuario ? usuario.get({ plain: true }) : null;
  };

  buscarPorId = async (id) => {
    await this.#ensureReady();
    const usuario = await this.#usuarioModel.findByPk(id);
    return usuario ? usuario.get({ plain: true }) : null;
  };
  actualizar = async (id, datos) => {
    await this.#ensureReady();
    await this.#usuarioModel.update(datos, { where: { id } });
    const usuario = await this.#usuarioModel.findByPk(id);
    return usuario ? usuario.get({ plain: true }) : null;
  };

  listarPorRol = async (rol) => {
    await this.#ensureReady();
    const rows = await this.#usuarioModel.findAll({
      where: { rol },
      order: [["id", "ASC"]],
    });
    return rows.map((r) => r.get({ plain: true }));
  };
}

export default UsuariosRepo;
