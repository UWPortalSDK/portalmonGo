// CREATE TABLE visited (stop_id INT, username VARCHAR(255), at DATETIME, pooplets INT)
// CREATE TABLE pooplets (username VARCHAR(255), pooplets INT)

function visitStop() {
    db.Declare('at', (new Date()).toISOSString());
	db.Execute('INSERT INTO visited VALUES(@stop_id, @currentUser, @at, @pooplets)')
}

function updatePooplets() {
    if (args.Get('pooplets') >= 0) {
        db.Execute('INSERT INTO pooplets VALUES (@currentUser, @pooplets)');   
    }
    
    return getPooplets();
}

function getPooplets() {
 	var raw = db.Execute('SELECT SUM(pooplets) FROM pooplets WHERE username=@currentUser');
    var res = JSON.parse(raw);
    
    return res[0].Column1;
}


function getProfile() {
    var profile = {
        username: user.Username,
		career: user.Student.Career,
		faculty: user.Student.Faculty,
		departments: user.Student.Departments,
		plans: user.Student.PlanTitles,
		form_of_study: user.Student.FormOfStudy,
		level: user.Student.Level,
        collected: {
         	geese: getPooplets()   
        }
	};
    
    return profile;
}