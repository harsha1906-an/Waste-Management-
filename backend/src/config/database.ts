import { Sequelize } from 'sequelize';
import config from './index';

// Determine dialect from DATABASE_URL
const dialect = config.databaseUrl.startsWith('sqlite:') ? 'sqlite' : 'postgres';
const storage = dialect === 'sqlite' ? config.databaseUrl.replace('sqlite:', '') : undefined;

const sequelize = new Sequelize(config.databaseUrl, {
  dialect: dialect as any,
  storage,
  logging: config.nodeEnv === 'development' ? console.log : false,
  pool: {
    max: 10,
    min: 0,
    acquire: 30000,
    idle: 10000,
  },
});

export const testConnection = async (): Promise<void> => {
  try {
    await sequelize.authenticate();
    console.log(`✅ Database connection established successfully (${dialect})`);
  } catch (error) {
    console.error('❌ Unable to connect to database:', error);
    throw error;
  }
};

export default sequelize;
