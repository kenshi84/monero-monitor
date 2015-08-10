function updateRedditFeed() {
  // Get Blockchain Explorer Info:
  var reddit = new XMLHttpRequest();
  reddit.open("GET", "http://www.reddit.com/r/monero/.json", true);
  reddit.onreadystatechange = function() {
    if (reddit.readyState == 4) {
      // JSON.parse does not evaluate an attacker's scripts.
      var resp = JSON.parse(reddit.responseText);
      for (i = 0; i < 10; i++) {
        writeRedditLine(resp.data.children[i], i);
      }
    }
  }
  reddit.send();
}

function writeRedditLine(info, i) {
  var upvote = info.data.ups;
  var downvote = info.data.downs;
  var score = upvote - downvote;
  var title = info.data.title;
  var comments = info.data.num_comments;
  var author = info.data.author;
  var link = info.data.url;
  var commentlink = 'https://www.reddit.com/' + info.data.permalink;
  var t_created = info.data.created_utc;
  var t_current = new Date().getTime() / 1000;
  var n_secs = t_current - t_created;
  var thumbnail = info.data.thumbnail;
  
  // Stickied?
  if (info.data.stickied) {
    document.getElementById('r-line' + i).style.fontWeight = "bold";
    document.getElementById('r-stickied').style.display = 'inline';
  }
  
  // Vote Count
  if (score >= 0) {
    document.getElementById('upvote-' + i).textContent = '+' + score;
    document.getElementById('upvote-' + i).style.color = "#00bb00";
  } else {
    document.getElementById('upvote-' + i).textContent = score;
    document.getElementById('upvote-' + i).style.color = "#bb0000";
  }
  
  // Thumbnails
  if (thumbnail == 'self') {
    document.getElementById('thumb-' + i).src = '/data/img/self.png';
  } else if (thumbnail == 'nsfw') {
    document.getElementById('thumb-' + i).src = '/data/img/nsfw.png';
  } else if (thumbnail == 'default') {
    document.getElementById('thumb-' + i).src = '/data/img/default.png';
  } else {
    document.getElementById('thumb-' + i).src = thumbnail;
  }
  
  // Title
  if (title.length > 100) {
    document.getElementById('title-' + i).textContent = title.substr(0,99) + '...';
  } else {
    document.getElementById('title-' + i).textContent = title;
  }
  var a_t = document.createElement('a');
  a_t.href = link;
  a_t.target = '_blank';
  a_t.class = 'title';
  document.getElementById('title-' + i).appendChild(a_t).appendChild(a_t.previousSibling);
  
  // Comments
  if (comments == 1) {
    document.getElementById('comment-' + i).textContent = '(' + comments + ' Comment)';
  } else {
    document.getElementById('comment-' + i).textContent = '(' + comments + ' Comments)';
  }
  var a_c = document.createElement('a');
  a_c.href = commentlink;
  a_c.target = '_blank';
  document.getElementById('comment-' + i).appendChild(a_c).appendChild(a_c.previousSibling);
  
  // Author
  document.getElementById('author-' + i).textContent = author;
  var a_a = document.createElement('a');
  a_a.href = 'https://reddit.com/u/' + author;
  a_a.target = '_blank';
  a_a.class = 'author';
  document.getElementById('author-' + i).appendChild(a_a).appendChild(a_a.previousSibling);
  
  // Age
  if (n_secs < 60) {
    document.getElementById('time-' + i).textContent = 'submitted ' + n_secs + ' seconds ago by ';
  } else if (n_secs < 3600) {
    var n_mins = n_secs / 60;
    document.getElementById('time-' + i).textContent = 'submitted ' + n_mins.toFixed(0) + ' minutes ago by ';
  } else if (n_secs < 172800) {
    var n_hrs = n_secs / 3600;
    document.getElementById('time-' + i).textContent = 'submitted ' + n_hrs.toFixed(0) + ' hours ago by ';
  } else {
    var n_days = n_secs / 86400;
    document.getElementById('time-' + i).textContent = 'submitted ' + n_days.toFixed(0) + ' days ago by ';
  }
}

function nextRedditPage() {
  chrome.tabs.create({'url': "https://www.reddit.com/r/monero/"});
}