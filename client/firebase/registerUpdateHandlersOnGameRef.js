import {
  getSnapshotOfAllPlayersByGameRef,
} from './firebase_utils.js';
import {
  getReduxGameRef,
  getPlayersInStore,
  setReduxGameProgressStatus,
  // setReduxGamePauseStatus,
  updatePlayerInReduxByKey,
  updateReduxPlayerStackByKey,
  updateReduxFieldStackByKey,
  setNertzHasBeenCalledInRedux,
  setPlayerNumWhoCalledNertzInRedux,
  updatePlayerScoreInReduxByKey
} from '../redux/reduxUtils'

export const updateReduxWhenNertzIsCalled = gameRef => {
  Promise.resolve(gameRef.child('nertzHasBeenCalled').on('value', snapshot => {
    setNertzHasBeenCalledInRedux(snapshot.val())
  }))
  .catch(err => console.error(err));

}

export const updateReduxWithPlayerNumWhoCalledNertz = gameRef => {
  Promise.resolve(gameRef.child('numOfPlayerWhoCalledNertz').on('value', snapshot => {setPlayerNumWhoCalledNertzInRedux(snapshot.val())}))
  .catch(err => console.error(err));
}

const updateReduxWithPlayerScores = gameRef => {
  const playerNums = Object.keys(getPlayersInStore())
  playerNums.forEach(playerNum => {
    gameRef.child(`players/${playerNum}/score`).on('value', scoreSnapshot => {
      updatePlayerScoreInReduxByKey(playerNum, scoreSnapshot.val())
    })
  })
}

const updateReduxWhenFieldStacksUpdate = (gameRef) => {
  return gameRef.child('fieldStacks').once('value')
    .then(allFieldStacks => allFieldStacks.forEach(stack => {
      stack.ref.on('value', stackSnapshot => {
        const stackKey = stackSnapshot.key;
        updateReduxFieldStackByKey(stackKey, stackSnapshot.val());
      })
    }))
}

const updateReduxWhenGameStatusChanges = () => {
  return getReduxGameRef()
    .child('isInProgress').on('value', isInProgress => {
      return setReduxGameProgressStatus(isInProgress.val())
    })
}


// //PAUSE BUTTON ON PAUSE
// const updateReduxWhenGamePauseStatusChanges = () => {
//   return getReduxGameRef()
//     .child('isGamePaused').on('value', isGamePaused => {
//       return setReduxGamePauseStatus(isGamePaused.val())
//     })
// }

export const updateReduxWhenPlayerDataChanges = (gameRef) => {
  return gameRef.child('players').once('value')
  .then(allPlayers => {
    allPlayers.forEach(player => {
      player.ref.on('value', updatedPlayer => {
        return updatePlayerInReduxByKey(updatedPlayer.key, updatedPlayer.val())
      })
    })
  })
}

// TODO: this isn't quite right, it's firing whenever a players cards change, we only want this to fire when a new player joins the game.
export const updateReduxWhenPlayersJoinGame = (gameRef) => {
  return gameRef.child('players').once('value')
    .then(allPlayers => {
      return allPlayers.ref.on('child_added', (player => {
        return updatePlayerInReduxByKey(player.key, player.val())
      }))
    })
    .then(() => updateReduxWithPlayerScores(gameRef))
}

// export const updateReduxWhenPlayersJoinGame = (gameRef) => {
//   return gameRef.child('players').on('value', playersSnapshot => {
//     const priorPlayerKeys = Object.keys(getPlayersInStore()).map(key => +key);
//     const allPlayerKeys = Object.keys(playersSnapshot.val()).map(key => +key);
//     const newPlayerKey = allPlayerKeys
//       .filter(key => !(priorPlayerKeys.includes(key)))[0]
//     const newPlayerData = playersSnapshot.val()[newPlayerKey];
//     return updatePlayerInReduxByKey(newPlayerKey, newPlayerData)
//   })
// }

// const updateReduxWhenPlayerStacksUpdate = (gameRef) => {
//   return getSnapshotOfAllPlayersByGameRef(gameRef)
//   .then((playersSnapshot) => {
//     playersSnapshot.forEach(playerSnapshot => {
//       playerSnapshot.child('stacks').forEach(stack => {
//         stack.ref.on('value', stackSnapshot => {
//           updateReduxPlayerStackByKey(stack.key, stackSnapshot.val())
//         })
//       })
//     })
//   })
// }

const updateReduxWhenPlayerStacksUpdate = (gameRef) => {
  return getSnapshotOfAllPlayersByGameRef(gameRef)
  .then((playersSnapshot) => {
    playersSnapshot.forEach(playerSnapshot => {
      const stackSnapshot = playerSnapshot.child('stacks')
        stackSnapshot.ref
        .on('child_changed', stack => {
          updateReduxPlayerStackByKey(stack.key, stack.val())
        })

      // .forEach(stack => {
      //   stack.ref.on('value', stackSnapshot => {
      //     updateReduxPlayerStackByKey(stack.key, stackSnapshot.val())
      //   })
      // })
    })
  })
}

export function registerUpdateHandlersOnGameRef(gameRef) {
  return Promise.all([
    updateReduxWhenGameStatusChanges(),
    // updateReduxWhenGamePauseStatusChanges(),
    updateReduxWhenFieldStacksUpdate(gameRef),
    updateReduxWhenPlayerStacksUpdate(gameRef),
    updateReduxWhenPlayerDataChanges(gameRef),
    updateReduxWhenNertzIsCalled(gameRef),
    updateReduxWithPlayerNumWhoCalledNertz(gameRef),
    updateReduxWithPlayerScores(gameRef)
  ]);
}

export const registerUpdateHandlerOnEachPlayer = (gameRef, handler) => {
  return gameRef.child('players').once('value')
    .then(snapshotOfAllPlayers => snapshotOfAllPlayers.forEach(player => {
      player.ref.on('value', handler);
    }))
}
