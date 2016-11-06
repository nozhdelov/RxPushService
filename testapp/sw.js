this.addEventListener('fetch', function(event){
	var url = new URL(event.request.url), req;
	
	
});


this.addEventListener('push', function(event) {
        var payload  = event.data ? event.data.text() : 'payload not sent';
        event.waitUntil(
        self.registration.showNotification('My Test App', {
                body: payload,
                icon: '',
                tag: 'my-tag'
        }));
});