exports.get404 = (req,res)=>{
    // res.send(`<h1 style: color="yellow">404 !! No page Found</h1>`)

    // res.sendFile(path.join(__dirname, '../' , 'node/views' , '404.html'));

    res.render('404' , {pageTitle: 'No Page Found!!!' , isAuthenticated: req.session.isLoggedIn});
};