import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('Błąd: Zmienna MONGO_URI nie jest zdefiniowana w pliku .env!');
      process.exit(1);
    }

    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB połączone: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Błąd połączenia z MongoDB: ${error instanceof Error ? error.message : 'Nieznany błąd'}`);
    process.exit(1); // Zatrzymaj serwer w przypadku braku połączenia
  }
};

export default connectDB;