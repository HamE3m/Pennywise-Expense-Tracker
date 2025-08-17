import mongoose from 'mongoose';

// Health check endpoint
export const healthCheck = async (req, res) => {
    try {
        const dbState = mongoose.connection.readyState;
        const states = {
            0: 'disconnected',
            1: 'connected',
            2: 'connecting',
            3: 'disconnecting'
        };

        const healthInfo = {
            status: dbState === 1 ? 'healthy' : 'unhealthy',
            timestamp: new Date().toISOString(),
            database: {
                state: states[dbState],
                stateCode: dbState
            },
            server: {
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                version: process.version
            }
        };

        if (dbState === 1) {
            // Test database operation
            await mongoose.connection.db.admin().ping();
            healthInfo.database.pingTest = 'successful';
        }

        res.status(dbState === 1 ? 200 : 503).json({
            success: dbState === 1,
            data: healthInfo
        });
    } catch (error) {
        res.status(503).json({
            success: false,
            error: error.message,
            timestamp: new Date().toISOString()
        });
    }
};
