call env.cmd
call codemirror_mode.cmd
call calcdeps.cmd

call build_externs.cmd
call build_login.cmd
python %CLOSURE_LIB%/closure/bin/build/closurebuilder.py -i ../js/app.js --root=%CLOSURE_LIB%/ --root=../js/ --namespace="org.koshinuke" --output_mode=compiled --compiler_jar=compiler.jar --compiler_flags="--define=goog.DEBUG=false" --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" --compiler_flags="--externs=externs/BranchActivity.js" --compiler_flags="--process_closure_primitives" > ../js/koshinuke-compiled.js
