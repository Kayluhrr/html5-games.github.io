/*!
 * Main JS code goes here
 */

// Globals
var postId;

// Init Parse
Parse.initialize("cF1KaOFNgSERAxKgv4ZUDE3XBnMEpGxF2ACWmMZE", "tnNd8KSP42GsJ9ZyBVaaN9REYRW76gUj9sxm8e3i");

// Init Parse objects
var Post = Parse.Object.extend("Post");
var Comment = Parse.Object.extend("Comment");
var Message = Parse.Object.extend("Message");

// Init DOM elements
var $linkTiles = $(".link-tile");
$linkTiles.eq(0).height($linkTiles.eq(1).height() + 32 /* Padding and Border */);

level1 = '<b>Newb</b> Can post in chat';
level2 = '<b>?</b> Can rate blog posts';
level3 = '<b>?</b> ?';
level4 = '<b>?</b> Can comment on blog posts';
level5 = '<b>?</b> ?';
level6 = '<b>?</b> ?';
level7 = '<b>?</b> Can write blog posts';
level8 = '<b>?</b> ?';
level9 = '<b>Moderator</b> Can edit and delete posts';
level10 = '<b>Leader</b> Can use admin features';
$("#level1").popover({html: true, placement: "bottom", content: level1});
$("#level2").popover({html: true, placement: "bottom", content: level2});
$("#level3").popover({html: true, placement: "bottom", content: level3});
$("#level4").popover({html: true, placement: "bottom", content: level4});
$("#level5").popover({html: true, placement: "bottom", content: level5});
$("#level6").popover({html: true, placement: "bottom", content: level6});
$("#level7").popover({html: true, placement: "bottom", content: level7});
$("#level8").popover({html: true, placement: "bottom", content: level8});
$("#level9").popover({html: true, placement: "bottom", content: level9});
$("#level10").popover({html: true, placement: "bottom", content: level10});

currentUser = Parse.User.current();
if (currentUser != null) {
	$("#username-profile").text(currentUser.get("username"));
	var joined = currentUser.createdAt;
	$("#joined-profile").text(joined.getMonth() + "/" + joined.getDate() + "/" + joined.getFullYear().toString().substring(2, 4));
	$("#level-profile").text(currentUser.get("level"));
	$(".persona-icon").each(function() {
		$(this).css("background-image", "url('http://www.gravatar.com/avatar/" + md5(currentUser.get("email")) + ".jpg?s=190&d=wavatar')");
	});
}

// Log In & Sign Up
function signUp() {
	// Get values
	var $username = $("#name-signup"),
	    $password = $("#psword-signup"),
	    $password2 = $("#psword2-signup"),
	    $email = $("#email-signup");
	    
	var username = $username.val(),
	    password = $password.val(),
	    password2 = $password2.val(),
	    email = $email.val();
	
	// Remove styling
	$username.parent().parent().removeClass("error");
	$password.parent().parent().removeClass("error");
	$password2.parent().parent().removeClass("error");
	$email.parent().parent().removeClass("error");
	$username.parent().children().eq(1).text("");
	$password.parent().children().eq(1).text("");
	$password2.parent().children().eq(1).text("");
	$email.parent().children().eq(1).text("");
	
	// Validate
	if (username.length == 0) {
		$username.parent().parent().addClass("error");
		return false;
	}
	else if (password.length < 7) {
			$password.parent().parent().addClass("error");
			$password.parent().children().eq(1).text("Password must be at least 7 characters!");
			return false;
	}
	else if (email.length == 0) {
			$email.parent().parent().addClass("error");
			return false;
	}
	else if (password != password2) {
		$password.parent().parent().addClass("error");
		$password2.parent().parent().addClass("error");
		$password.parent().children().eq(1).text("Passwords don't match!");
		return false;
	}
	
	// Sign up user
	var user = new Parse.User();
	user.set("username", username);
	user.set("password", password);
	user.set("email", email);
	user.set("level", 1);

	user.signUp(null, {
		success: function(user) {
			// Login user
			Parse.User.logIn(username, password, {
				success: function(user) {
					buildMenu();
				},
				error: function(user, error) {
					alert("Error: " + error.code + " " + error.message);
					return false;
				}
			});
			
			// Hide modal
			$("#signup").modal("hide");
			
			// Show menu
			$("#login-menu-link").dropdown('toggle');
		},
		error: function(user, error) {
			if (error.code == 202) {
				$username.parent().parent().addClass("error");
				$username.parent().children().eq(1).text("Username taken!");
				return false;
			}
			else {
				alert("Error: " + error.code + " " + error.message);
				return false;
			}
		}
	});
}

function logIn() {
	// Get values
	var $username = $("#name-login"),
	    $password = $("#psword-login");
	    
	var username = $username.val(),
	    password = $password.val();
	
	// Remove styling
	$username.parent().parent().removeClass("error");
	$password.parent().parent().removeClass("error");
	$username.parent().children().eq(1).text("");
	$password.parent().children().eq(1).text("");
	
	// Validate
	if (username.length == 0) {
		$username.parent().parent().addClass("error");
		return false;
	}
	else if (password.length == 0) {
			$password.parent().parent().addClass("error");
			return false;
	}
	
	Parse.User.logIn(username, password, {
		success: function(user) {
			buildMenu();
			
			// Hide modal
			$("#login").modal("hide");

			// Show menu
			$("#login-menu-link").dropdown('toggle');
		},
		error: function(user, error) {
			if (error.code == 101) {
				$username.parent().parent().addClass("error");
				$password.parent().parent().addClass("error");
				return false;
			}
			else {
				alert("Error: " + error.code + " " + error.message);
				return false;
			}
		}
	});
}

function logOut() {
	Parse.User.logOut();
	window.location.href = 'index.html';
	buildMenu();
}

function buildMenu() {
	// Get login menu
	$loginMenu = $("#login-menu");
	
	// Clear login menu
	$loginMenu.html("");
	
	// If user not logged in
	if (Parse.User.current() == null) {
		$login = $('<li><a tabindex="-1" href="#login" role="button" data-toggle="modal">Login</a></li>');
		$signup = $('<li><a tabindex="-1" href="#signup" role="button" data-toggle="modal">Sign Up</a></li>');
		$("#login-menu").append($login);
		$("#login-menu").append($signup);
	}
	// If user logged in
	else {
		$profile = $('<li><a tabindex="-1" href="profile.html">Hi, ' + Parse.User.current().get("username") + '</a></li>');
		$logout = $('<li><a tabindex="-1" href="#" onclick="logOut();">Logout</a></li>');
		$("#login-menu").append($profile);
		$("#login-menu").append($logout);
	}
}

buildMenu();

// Chat
function sendMessage() {
	// Make sure that user is logged in
	currentUser = Parse.User.current();
	if (currentUser == null) {
		alert("You must login to use chat.");
		return false;
	}
	
	text = $("#message-chat").val();
	
	// Make sure that message isn't empty
	if (text == "") {
		alert("Can't send empty message!");
		return false;
	}
	
	// Make sure that message doesn't contain a "<"
	if (text.indexOf("<") > 0) {
		alert("HTML is not allowed in chat!");
		return false;
	}
	
	
	// Create new message
	var message = new Message();
	message.set("text", text);
	message.set("user", currentUser.get("username"));
	
	// Save message
	message.save(null, {
		success: function(message) {
			// Clear message box
			$("#message-chat").val("");
			
			// Update message display
			displayMessages();
		},
		error: function(message, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function displayMessages() {
	$messages = $("#all-messages-chat");
	
	// Get messages from Parse
	var query = new Parse.Query(Message);
	
	// Retrieve only the most recent ones
	query.descending("createdAt");
	 
	// Retrieve only the last 25
	query.limit(25);
	
	query.find({
		success: function(messages) {
			// The final html for $messages
			var result = "";
	
			while (messages.length > 0) {
				var messageObject = messages.pop();
				var user = messageObject.get("user");
				var m = '<div class="messages">';
				m += user + " ";
				m += "(" + messageObject.createdAt.toLocaleTimeString() + "): ";
				m += messageObject.get("text");
				m += "</div>"
				result += m;
			}
			
			$messages.html(result);
			
			// Scroll div
			var chatDiv = document.getElementById("all-messages-chat");
			chatDiv.scrollTop = chatDiv.scrollHeight; 
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

// Blog
function post() {
	// Make sure that user is logged in
	currentUser = Parse.User.current();
	if (currentUser == null) {
		alert("You must login to write posts.");
		return false;
	}
	
	// Make sure that user at least level 7
	//if (currentUser.get("level") < 7) {
	//	alert("You must be level 7 or higher to write posts.");
	//	return false;
	//}
	
	// Get post data
	var title = $("#title-post").val();
	var text = $("#text-post").val();
	var tags = [];
	if ($("#tag1-post").val() != "") {
		tags.push($("#tag1-post").val());
	}
	if ($("#tag2-post").val() != "") {
		tags.push($("#tag2-post").val());
	}
	if ($("#tag3-post").val() != "") {
		tags.push($("#tag3-post").val());
	}
	if ($("#tag4-post").val() != "") {
		tags.push($("#tag4-post").val());
	}
	
	// Create new post
	var post = new Post();
	post.set("title", title);
	post.set("text", text);
	post.set("tags", tags);
	post.set("user", currentUser.get("username"));
	
	// Save message
	post.save(null, {
		success: function(post) {
			// Hide modal
			$("#post").modal("hide");
			
			// Update posts
			displayPosts();
		},
		error: function(message, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function comment() {
	// Make sure that user is logged in
	currentUser = Parse.User.current();
	if (currentUser == null) {
		alert("You must login to write posts.");
		return false;
	}
	
	// Make sure that user at least level 4
	//if (currentUser.get("level") < 4) {
	//	alert("You must be level 4 or higher to write posts.");
	//	return false;
	//}
	
	// Get comment data
	var text = $("#text-comment").val();
	
	// Create new comment
	var comment = new Comment();
	comment.set("text", text);
	comment.set("post", postId);
	comment.set("user", currentUser.get("username"));
	
	// Save message
	comment.save(null, {
		success: function(comment) {
			// Hide modal
			$("#comment").modal("hide");
			
			// Update posts
			displayPosts();
		},
		error: function(message, error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function displayPosts() {
	$article = $("article");

	// Get messages from Parse
	var query = new Parse.Query(Post);

	// Retrieve only the most recent ones
	query.descending("createdAt");

	// Retrieve only the last 5
	query.limit(5);

	query.find({
		success: function(posts) {
			// The final html for $article
			var result = "";
			
			var n = 0;
			var posts2 = [];
			while (posts.length > 0) {
				// Update n
				n++;
				
				// Get post data
				var post = posts.pop();
				var title = post.get("title");
				var text = post.get("text");
				var user = post.get("user");
				var createdAt = post.createdAt;
				
				posts2.unshift(post);
				
				// Post
				var p = '<section class="post block"><div class="container">';
				p += '<h2>' + title + '</h2>';
				p += '<p class="lead-small">Posted '; 
				p += 'on ' + createdAt.toLocaleDateString();
				p += ' by ' + user;
				p += ' - <a href="#comments-link-' + n + '">0 comments</a></p>';
				p += '<div class="panel lead">' + text + '</div>';
				
				// Comments
				p += '<section class="comments" id="comments-link-' + n + '">';
				p += '<h3>Comments</h3>';
				p += '<div id="comments-' + n + '">';
				p += '<p class="lead-small">Loading...</p>';
				p += '</div>';
				p += '<button class="btn" tabindex="-1" onclick="postId=\'' + post.id + '\';$(\'#comment\').modal(\'show\');">Post Comment</button>';
				p += '</div>';
				
				// End post
				p += '</section></div></section>';
				result += p;
			}

			$article.html(result);
			
			for (i = n; i > 0; i--) {
				loadComments(posts2[i - 1], i);
			}
		},
		error: function(error) {
			alert("Error: " + error.code + " " + error.message);
		}
	});
}

function loadComments(post, n) {
	// Get div
	$comments = $("#comments-"+n);
	
	// Load comments
	var query = new Parse.Query(Comment);
	query.equalTo("post", post.id);
	query.descending("createdAt");
	query.find({
		success: function(comments) {
			if (comments.length == 0) {
				$comments.html('<p class="lead-small">No comments</p>');
			}
			else {
				var result = "";
				while (comments.length > 0) {
					// Get comment data
					var comment = comments.pop();
					var text = comment.get("text");
					var user = comment.get("user");
					var createdAt = comment.createdAt;

					// By who, when
					var c = '<div class="comment">';
					c += 'By ' + user;
					c += ' at ' + createdAt.toLocaleTimeString();
					c += ' on ' + createdAt.toLocaleDateString();

					// Comment
					c += '<p class="lead-small">';
					c += text;
					c += '</p>';

					// End comment
					c += '</div>';
					result += c;
				}
				
				$comments.html(result);
			}
		}
	});
}
