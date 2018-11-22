import * as shell from "shelljs";

shell.cp('-r', 'src/public/', 'dist/');
// shell.cp('src/routes/index.js', 'dist/routes/')