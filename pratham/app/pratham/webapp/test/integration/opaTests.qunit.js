sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'pratham/test/integration/FirstJourney',
		'pratham/test/integration/pages/deptviewsList',
		'pratham/test/integration/pages/deptviewsObjectPage'
    ],
    function(JourneyRunner, opaJourney, deptviewsList, deptviewsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('pratham') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onThedeptviewsList: deptviewsList,
					onThedeptviewsObjectPage: deptviewsObjectPage
                }
            },
            opaJourney.run
        );
    }
);