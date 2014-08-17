MVC-vs-DIY-patterns
===================

2 examples of a way to structure code. One solved with Angular, another solved with some OOP-esque JavaScript patterns.
These solutions are ways to solve the rendering of friends in a list done by asynchronous API calls. [Example can be seen here.](http://www.vinhalbwachs.com/AngularThinControllerExample)

When the app receivs changes from the 'backend', it gets a list of friends to either add or remove. If a friend gets added, they should be appened to the bottom of the list. If they get removed, they should disappear.

When a user clicks a name, the color changes to indicate a pending delete and reverts back when clicked again to 'unschedule' the deletion.

The delete friends shows if there is at least one pending deletion, otherwise it's not visible.

When the user clicks the 'Delete Friends' button, any selected names should be submitted api.submitUserChanges as an array of 'remove' actions and the names should be removed from the list. Note that the friend update listener.
