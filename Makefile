JSLINT_HOME=/usr/share/jslint
BINPATH=/usr/bin

JSLint/jslint.js:
	[ -e "JSLint/.git"  ] || git clone https://github.com/douglascrockford/JSLint.git ./JSLint
	[ -e "JSLint/.git"  ] && cd ./JSLint &&  git pull origin
$(JSLINT_HOME): 
	[  -d "$$(JSLINT_HOME)"  ] || mkdir -p $(JSLINT_HOME)
install:
	echo '#!'`which node` > $(BINPATH)/jslint
	cat jslintrun.js >> $(BINPATH)/jslint && cp JSLint/jslint.js $(JSLINT_HOME)  && echo "jslint installed successfully";

deinstall:
	rm $(BINPATH)/jslint && rm -r $(JSLINT_HOME)
clean:
	[ -e "JSLint" ] && rm -fr JSLint

.PHONY: clean deinstall install JSLint/jslint.js

