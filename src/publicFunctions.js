async function checkConnection(generateMessage, activeComponent) {
    let serverConnection = activeComponent.$store.state.connection;
    serverConnection.onclose = function () {
        alert("connection closed");
        setTimeout(checkConnection, 100, function() {
            if (activeComponent.$store.state.token) {
                let message = {
                    type: "NewCon",
                    contents: {
                        token: activeComponent.$store.state.token
                    }
                };

                serverConnection.send(JSON.stringify(message));
            } else {
                serverConnection.onclose(undefined);
            }

        }, activeComponent);
    };
    if (serverConnection.readyState === 0) {
        serverConnection.onopen = generateMessage;
    } else if (serverConnection.readyState === 1) {
        generateMessage();
    } else if (serverConnection.readyState > 1) {
        alert("connection not ready");
        let store = activeComponent.$store;
        const connectionPromise = new Promise(function (resolve) {
            store.dispatch('resetConnection');
            resolve();
        });
        await connectionPromise;
        serverConnection = store.state.connection;
        serverConnection.onopen = generateMessage;
    }
    serverConnection.onerror = error => {
        alert(`WebSocket error: ${error.toString()}`)      //TODO change to console
    };

    // start hosting a game
    serverConnection.onmessage = response => {
        response = JSON.parse(response.data);

        switch (response.type) {

            case "route":
                activeComponent.$router.push(response.contents.destination);
                break;

            case "error":
                alert('Firebase error: ' + response.contents.errorMessage);
                break;

            case "full":
                alert(response.contents.errorMessage);
                break;

            case "rooms":
                if (activeComponent.updateRoomTable)
                    activeComponent.updateRoomTable(response.contents);
                break;

            case "RoomData":
                if (activeComponent.updateRoom)
                    activeComponent.updateRoom(response.contents);
                break;

            case "gameData":
                if (activeComponent.updateGame)
                    activeComponent.updateGame(response.contents);
                break;
            case "newCard":
                if (activeComponent.seenCards && response.contents)
                    activeComponent.updateSeenCards(response.contents.id, response.contents);
                break;
            case "allCards":
                if (activeComponent.allCards) {
                    activeComponent.displayAll(response.contents);
                }
                break;
            case "decknames":
                if (activeComponent.deckNames) {
                    activeComponent.deckNames = response.contents.decknames;
                }
                break;
            case "deck":
                if (activeComponent.deckNames) {
                    activeComponent.updateDeck(response.contents);
                }
                break;
            case "saved":
                if (activeComponent.deckNames) {
                    activeComponent.savedSuccessfully();
                }
                break;
        }
    }
}

export {checkConnection};