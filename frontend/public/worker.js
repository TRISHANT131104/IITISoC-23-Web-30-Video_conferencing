let array = [];

self.addEventListener("message", event => {
    if (event.data === "download") {
        const blob = new Blob(array,{}); // Pass empty options object
        self.postMessage(blob);
        array = [];
    } else {
        array.push(event.data);
        console.log(array)
    }
});
