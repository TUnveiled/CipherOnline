async function checkConnection(generateMessage, activeComponent) {
    let serverConnection = activeComponent.$store.state.connection;
    if (serverConnection.readyState === 0) {
        serverConnection.onopen = generateMessage;
    } else if (serverConnection.readyState === 1) {
        generateMessage()
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
        alert(`WebSocket error: ${error}`)      //TODO change to console
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
        }
    }
}

export {checkConnection};