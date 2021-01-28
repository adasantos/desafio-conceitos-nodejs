const express = require("express");
const cors = require("cors");

const { v4: uuid, validate: isUuid } = require('uuid');

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function isRepositoryExist(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id)) {
    return response.status(400).json({ error: "Invalid repository ID"})
  }

  const repositoryIndex = repositories.findIndex( repository => {
    return repository.id === id;
  });

  if(repositoryIndex < 0){
    return response.status(400).json({ error: "Repository not found"})
  }

  request.params.repositoryIndex = repositoryIndex;

  return next();
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.status(201).json(repository);
});

app.put("/repositories/:id", isRepositoryExist, (request, response) => {
  const { repositoryIndex } = request.params;
  const { title, url, techs } = request.body;

  const repository = {
    id: repositories[repositoryIndex].id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes
  };

  repositories[repositoryIndex] = repository;

  return response.status(200).json(repository);
});

app.delete("/repositories/:id", isRepositoryExist, (request, response) => {
  const { repositoryIndex } = request.params;

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();
});

app.post("/repositories/:id/like", isRepositoryExist, (request, response) => {
  const { repositoryIndex } = request.params;

  repositories[repositoryIndex].likes += 1; 

  return response.status(200).json(repositories[repositoryIndex]);
});

module.exports = app;
