// Use per-request models attached by auth middleware
// C - Crear JUEGO
exports.crearJuego = async (req, res) => {
  try {
    const Juego = req.models.Juego;
    const nuevoJuego = new Juego(req.body);
    await nuevoJuego.save();
    res.status(201).json(nuevoJuego);
  } catch (error) {
    res.status(400).json({
      error: 'Error al agregar juego. Verifique campos',
      details: error.message
    });
  }
};

// R - Obtener todos los juegos
exports.obtenerJuegos = async (req, res) => {
  try {
    const Juego = req.models.Juego;
    const juegos = await Juego.find();
    res.status(200).json(juegos);
  } catch (error) {
    res.status(500).json({ error: 'Error interno del servidor al obtener juegos' });
  }
};

// R - Obtener juego por ID
exports.obtenerJuegoPorId = async (req, res) => {
  try {
    const Juego = req.models.Juego;
    const juego = await Juego.findById(req.params.id);
    if (!juego) {
      return res.status(404).json({ msg: 'Juego no encontrado' });
    }
    res.status(200).json(juego);
  } catch (error) {
    res.status(500).json({ error: 'Error al buscar el juego' });
  }
};

// U - Actualizar juego
exports.actualizarJuego = async (req, res) => {
  try {
    const Juego = req.models.Juego;
    const juego = await Juego.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!juego) {
      return res.status(404).json({ msg: 'Juego no encontrado para actualizar' });
    }
    res.status(200).json(juego);
  } catch (error) {
    res.status(400).json({
      error: 'Error al actualizar el juego',
      details: error.message
    });
  }
};

// D - Eliminar juego
exports.eliminarJuego = async (req, res) => {
  try {
    const Juego = req.models.Juego;
    const juego = await Juego.findByIdAndDelete(req.params.id);
    if (!juego) {
      return res.status(404).json({ msg: 'Juego no encontrado para eliminar' });
    }
    res.status(200).json({ msg: 'Juego eliminado exitosamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el juego' });
  }
};