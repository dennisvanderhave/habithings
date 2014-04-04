define({
    type: '',
	defaults: {
        enabled: false
    },
    definition: {
        uuid: '',
        version: '',
        name: '',
        allowMultiple: true
    },
    commands: {
        discover: function() { },
        load: function() { },
        poll: function() { },
        unload: function() { }
    }
});