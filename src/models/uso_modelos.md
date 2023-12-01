# from_dataset_model.pkl
- Modo Easy, ha sido entrenado con 100000 epochs
- Así se carga el modelo en python, buscar la versión en java
	- modelo_cargado = joblib.load('from_dataset_model.pkl')
- Al modelo se le pasa el tablero, cambiando:
	- 'x' por 2.0
	- 'o' por 1.0
	- ' ' por 0.0

# model_medium.h5 / model_hard.h5
![image](https://github.com/Gabriel-R-L/Suite_Sensores_Multimedia/assets/121958702/ba1b61b5-17b9-401d-9780-44ae13edc565)
- El medium ha sido entrenado con 75000 epochs
- El medium_hard ha sido entrenado con 150000 epochs
- El hard ha sido entrenado con 200000 epochs
- El modelo recibe el tablero como una numpy array y devuelve una puntiación

- Función que genera legal_moves
  ```
	def legal_moves_generator(current_board_state,turn_monitor):
    """Function that returns the set of all possible legal moves and resulting board states, 
    for a given input board state and player

    Args:
    current_board_state: The current board state
    turn_monitor: 1 if it's the player who places the mark 1's turn to play, 0 if its his opponent's turn

    Returns:
    legal_moves_dict: A dictionary of a list of possible next coordinate-resulting board state pairs
    The resulting board state is flattened to 1 d array

    """
    legal_moves_dict={}
    for i in range(current_board_state.shape[0]):
        for j in range(current_board_state.shape[1]):
            if current_board_state[i,j]==2:
                board_state_copy=current_board_state.copy()
                board_state_copy[i,j]=turn_monitor
                legal_moves_dict[(i,j)]=board_state_copy.flatten()
    return legal_moves_dict
  ```
- Diccionario legal_dict
```
{
	(0, 0): array([1, 2, 2, 2, 2, 2, 2, 2, 2]),
	(0, 1): array([2, 1, 2, 2, 2, 2, 2, 2, 2]),
	(0, 2): array([2, 2, 1, 2, 2, 2, 2, 2, 2]),
	(1, 0): array([2, 2, 2, 1, 2, 2, 2, 2, 2]),
	(1, 1): array([2, 2, 2, 2, 1, 2, 2, 2, 2]),
	(1, 2): array([2, 2, 2, 2, 2, 1, 2, 2, 2]),
	(2, 0): array([2, 2, 2, 2, 2, 2, 1, 2, 2]),
	(2, 1): array([2, 2, 2, 2, 2, 2, 2, 1, 2]),
	(2, 2): array([2, 2, 2, 2, 2, 2, 2, 2, 1])
}
```
- Array pasado al modelo al hacer la predicción
	- Con numpy
	```
	import numpy as np
 
	print(dict, '\n')
	for legal_move_coord in legal_dict:
	    print('Array pasado al modelo', legal_dict[legal_move_coord].reshape(1,9))
	    # print('Array pasado al modelo', [legal_dict[legal_move_coord][i:i+9] for i in range(0, 9)])
	```
 	- Sin numpy, sacar el primer elemento de los 9 que genera
    	```
		print(dict, '\n')
		for legal_move_coord in legal_dict:
		    print('Array pasado al modelo', [legal_dict[legal_move_coord][i:i+9] for i in range(0, 9)])
  	```
- Función que usa al modelo para hacer la predicción
  ```
  def move_selector(model,current_board_state,turn_monitor):
    """Function that selects the next move to make from a set of possible legal moves

    Args:
    model: The Evaluator function to use to evaluate each possible next board state
    turn_monitor: 1 if it's the player who places the mark 1's turn to play, 0 if its his opponent's turn

    Returns:
    selected_move: The numpy array coordinates where the player should place thier mark
    new_board_state: The flattened new board state resulting from performing above selected move
    score: The score that was assigned to the above selected_move by the Evaluator (model)

    """
    tracker={}
    legal_moves_dict=legal_moves_generator(current_board_state,turn_monitor)
    for legal_move_coord in legal_moves_dict:
        score=model.predict(legal_moves_dict[legal_move_coord].reshape(1,9))
        tracker[legal_move_coord]=score
    selected_move=max(tracker, key=tracker.get)
    new_board_state=legal_moves_dict[selected_move]
    score=tracker[selected_move]
    return selected_move,new_board_state,score
  ```
