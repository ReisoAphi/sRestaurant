// src/controllers/settingController.ts
import { Request, Response } from 'express';
import { Setting } from '../models';

// Obtener todas las configuraciones
export const getSettings = async (req: Request, res: Response) => {
    try {
        const settings = await Setting.findAll();
        // Convertir el array de objetos en un solo objeto para fácil acceso en el frontend
        const settingsMap = settings.reduce((acc, setting) => {
            acc[setting.key] = setting.value;
            return acc;
        }, {} as Record<string, string>);
        res.json(settingsMap);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener la configuración', error });
    }
};

// Actualizar configuraciones
export const updateSettings = async (req: Request, res: Response) => {
    try {
        const settingsToUpdate: Record<string, string> = req.body;
        
        for (const key in settingsToUpdate) {
            await Setting.upsert({ key, value: settingsToUpdate[key] });
        }

        res.json({ message: 'Configuración actualizada correctamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar la configuración', error });
    }
};