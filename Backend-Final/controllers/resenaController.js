// Use per-request models attached by auth middleware
// C - Crear reseña
exports.crearResena = async (req, res) => {
    try {
        const Resena = req.models.Resena;
        const nuevaResena = new Resena(req.body);
        await nuevaResena.save();
        res.status(201).json(nuevaResena);
    } catch (error) {
        res.status(400).json({
            error: 'Error al crear la reseña',
            details: error.message
        });
    }
};

// R - Obtener todas las reseñas
exports.obtenerResenas = async (req, res) => {
    try {

        const Resena = req.models.Resena;
        const filtro = req.query.juegoId ? { juego: req.query.juegoId } : {};

        const resenas = await Resena.find(filtro).populate('juego', 'nombre');
        res.status(200).json(resenas);
    } catch (error) {
        res.status(500).json({ error: 'Error al obtener las reseñas' });
    }
};

// R - Obtener reseña por ID
exports.obtenerResenaPorId = async (req, res) => {
    try {
        const Resena = req.models.Resena;
        const resena = await Resena.findById(req.params.id).populate('juego', 'nombre');
        if (!resena) {
            return res.status(404).json({ msg: 'Reseña no encontrada' });
        }
        res.status(200).json(resena);
    } catch (error) {
        res.status(500).json({ error: 'Error al buscar la reseña' });
    }
};

// U - Actualizar reseña
exports.actualizarResena = async (req, res) => {
    try {
        const Resena = req.models.Resena;
        const resena = await Resena.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        });
        if (!resena) {
            return res.status(404).json({ msg: 'Reseña no encontrada para actualizar' });
        }
        res.status(200).json(resena);
    } catch (error) {
        res.status(400).json({
            error: 'Error al actualizar la reseña.',
            details: error.message
        });
    }
};

// D - Eliminar reseña
exports.eliminarResena = async (req, res) => {
    try {
        const Resena = req.models.Resena;
        const resena = await Resena.findByIdAndDelete(req.params.id);

        if (!resena) {
            return res.status(404).json({ msg: 'Reseña no encontrada para eliminar' });
        }

        res.status(200).json({ msg: 'Reseña eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: 'Error al eliminar la reseña' });
    }
};