{
	"targets": [
		{
			"target_name": "CarbonVideoBackendHelper",
			"sources": [
				"Core.cc",
				"Validators.cc"
			],
			"include_dirs" : [
				"<!(node -e \"require('nan')\")"
			]
		}
	]
}
