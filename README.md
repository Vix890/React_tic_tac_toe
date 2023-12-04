# Hacer git clone 
- npm install para instalar todas las dependecias

# Configuracion
## en node_modules/react-scripts/webpack.config.js
- Dentro de resolve
  - fallback: {
        "path": require.resolve("path-browserify")
      }

# Info de la app

## Planteamiento
Juego de tres en raya con dos modos de juego, jugador contra jugador y jugador vs IA  
-La IA ha sido entrenada con 200.000 epochs (veces que se ejecuta a la hora de entrenar)  
El nivel de la IA es fácil (es más dificil jugar a perder)

## Funcionamiento
Numjs para transformar el tablero a algo que entienda la IA  
Tensorflowjs para cargar y usar el modelo  
En el modo IA el personaje cambia de forma aleatoria

## Carga y recarga de la página
- Borramos el localStorage para vaciar el tablero
- Se hace tanto al cargar, como al regargar
```
window.addEventListener("load", () => resetGameStorage());
window.addEventListener("beforeunload", () => resetGameStorage());
window.addEventListener("unload", () => resetGameStorage());
```

## Menu
- Creamos la root y renderizamos el menu
```
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Menu />
  </React.StrictMode>
);
```

- Renderizar menu
- Renderizar PvP o IA dependiendo de el select options
```
switch (mode) {
  case "pvp":
    return <Pvp />;

  case "ia":
    return <IA />;
}
```

- Listener para cambio de modo
  - Reinicia el tablero
```
const handleMenuItemChange = (selected) => {
  setMode(selected);
  resetGameStorage();
};
```


## Modelo
Modelo creado de tipo keras (.h5) creado y entrenado en python, usando tensorflowjs_converter para convertirlo en el .json y el .bin
(Al convertir el modelo fue necesario hacerlo desde replit para evitar fallos de configuración, etc)

- Cargar el modelo
```
(async () => {
  model = await tf.loadLayersModel(modelUrl);
})();
```

- El modelo recibe un array con un posible movimiento y le asigna una puntuación.
```
[[2, 2, 2, 2, 2, 2, 2, 2, 2]]
```

- Hacemos las predicciones
```
const tracker = {};
  for (const legal_move in legalMoves) {
    var posibleMove = nj.array(legalMoves[legal_move]).tolist()[0];

    const inputTensor = tf.tensor2d([posibleMove]);

    const score = model.predict(inputTensor);
    tracker[legal_move] = score;
  }
```

- Eligimos el movimiento con mejor puntuación
```
const selectedMove = Object.keys(tracker).reduce((a, b) => tracker[a] > tracker[b] ? a : b);
```

- Actualizar tablero
```
board[index] = turn;
setBoard([...board]);
```
- Cambiar el turno
```
const newTurn = turn === TURNS.X ? TURNS.O : TURNS.X;
turn = newTurn;
setTurn(newTurn);
```
- Guardar en el localStorage
```
saveGameToStorage({
  board: board,
  turn: newTurn,
});
```
- Comprobar si se ha acabado el juego
```
if (newWinner) {
  setWinner(newWinner);
  return;
} else if (checkEndGame(board)) {
  setWinner(false); // empate
  return;
}
```