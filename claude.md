I have made changes in my front end not currently do not worry about additional UI items just fix the front end like ui components things connexion with index.html and electron to test wih back end and so much like ,I have connected it to the servers Back end apis so your task is to Remove redundant items like it are not connected To the back end I'm so, 




Here are some more changes that need to be done in the application table there is a status column That status column should be inside this is specifically for the application table when we click the company name in the application table it will open a new page am I right so inside that new page instead of notes we have already removed the notes so instead of notes there should be a QnA section And a current condition of that application like pending rejected or accepted So mostly in the application form primary selection is pending OK When the user clicks accepted it will this application will go to startup as usual and removed from the application table And go to the startup table And will follow the startup schemas





Need to @detacheble-window.html dragable And AI insignt window should be transparent Even the error block the search block and everything should only have borders the background is transparent That's why I'm what I'm trying to say  The dragger block which I might ask KIN and better should be solid but the AI chat interface that opens after clicking ask AI should be transparent only the bottles Should I wish and there should be some percentage of transparency that we can add it later plus the text should be black inside that whole block Whatever even if it refries from the AI using the account it should be in black Except better it should be transparent but it should not be black,





So there are two different things application inside that application I regulate the company it should open Q and A and the status of that application but in the startup when we click the company name it will show the summary 




So there is AQ and a column in application table so you have to remove that column from the table and add it to the summary section so So remove the notes inside that summary section for the application when we click the application name it will open that summary section right so inside that summary section put that QnA column, for that there is some specific hover option for the QnA column in the application table you should also remove that Better Hoover option is very specific for QnA so that you have to work on it you have to remove it from the table because the Q and a section is going inside the page which will open after clicking the name of the application in the application table 





Play the sidebar there are three buttons application startup and meeting Your task is to add a phones button there so what will it do it will call @from.html the additional user elements It's connected to the back end we will connect it to the back end later So how it works here is the explanation of when on the side but user clicks on the forms button forms section whatever we say It will open It's content its content is some pair of question answers or some this type of there's some type of question and user have to answer in some specific type of format like drop down or something like that that's completely described in forms html So this is how it works there are some permanent sections that user cannot edit Add some temporary sections that user can edit all the functionality is defined in forms html





So what you have to do is when we run npm start or when we open the application The main electron application it will open the login dot html firstly so currently it is not connected to the back end So admin admin will work as User id and password And we can also Enter the application by sign up so we can fill all the fields as admin at the admin And the password as admin and when we click sign up so only the feature that I'm telling right now will open after the user clicks sign up not after the login ok because this is the feature for the new whoever is joining this electron application first time so here out how it works it will open the prefrence.html Where the user have to select its preference or user can also write it preference every functionality is mentioned in preference dot html file that's inside additional ui elements OK when user have done all these things this thing will be shared to the back end we will implement it's connexion later Okay when user have done all the things the field all the things are selected things the functionality is defined in preference dot html there is a submit button at the end when user clicks submit button it will lead to the main application page like main page of this application where users see the application table




The connection between @detachable-window.html and the Play button in @index.html is currently broken.What I want is this:When I click the Play button (bottom-right of the page), it should open @detachable-window.html in a separate Electron window. Only the main div inside that file should be visible.Inside the detachable window, when I press the Ask button, it should open a panel right below it. That panel should have around 20% transparency.When the user clicks the End button, it should close the detachable window and open another window using @diff.html. This is possible because we’re in an Electron environment.The diff window will display the comparison results (the “flare of comparison”) that we get from the main application’s backend. The backend gives us data in pairs, and for each pair the user decides Accept or Reject.When all pairs have been processed (every pair has an action), the diff window should close and the main Electron application (the one we are building) should automatically open again.





So currently focus on adding UI elements connecting UI elements and how they should be triggered And how they should be end We will try to add backend to it later