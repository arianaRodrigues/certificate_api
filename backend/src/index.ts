import app from "./app";
import { AppDataSource } from "./data-source";
import { seedDatabase } from "./seed";

seedDatabase(AppDataSource).catch((error) => {
  console.error("Erro ao rodar seed:", error);
});

AppDataSource.initialize()
  .then(() => {
    const port = process.env.PORT || 3000;

    app.listen(port, () => {
      console.log(`App is running!`);
    });
  })
  .catch((err) => console.error(err));
