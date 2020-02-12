async function checkConnection(generateMessage, activeComponent) {
    let serverConnection = activeComponent.$store.state.connection;
    serverConnection.onclose = function () {
        setTimeout(checkConnection, 100, function() {
            if (activeComponent.$store.state.token) {
                let message = {
                    type: "NewCon",
                    contents: {
                        token: activeComponent.$store.state.token
                    }
                };

                serverConnection.send(JSON.stringify(message));
            }

        }, activeComponent);
    };
    if (serverConnection.readyState === 0) {
        serverConnection.onopen = generateMessage;
    } else if (serverConnection.readyState === 1) {
        generateMessage();
    } else if (serverConnection.readyState > 1) {
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
                if (activeComponent.seenCards)
                    activeComponent.seenCards[response.contents.id] = response.contents;
                break;
        }
    }
}

export {checkConnection};