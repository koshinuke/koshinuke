call env.cmd

python %CLOSURE_LIB%/closure/bin/build/closurebuilder.py -i ../js/login.js --root=%CLOSURE_LIB%/ --root=../js/ --namespace="org.koshinuke" --output_mode=compiled --compiler_jar=compiler.jar --compiler_flags="--define=goog.DEBUG=false" --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS" > ../js/login-compiled.js
