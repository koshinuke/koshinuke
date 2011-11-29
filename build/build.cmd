call env.cmd
call codemirror_mode.cmd
call calcdeps.cmd

python %CLOSURE_LIB%/closure/bin/build/closurebuilder.py -i ../js/app.js --root=%CLOSURE_LIB%/ --root=../js/ --namespace="org.koshinuke" --output_mode=compiled --compiler_jar=compiler.jar --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > ../js/koshinuke-compiled.js
