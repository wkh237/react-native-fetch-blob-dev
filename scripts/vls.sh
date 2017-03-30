ISSUE_NUM=$1
ACTION=$2

if [ "$#" = 0 ]; then
	git branch | grep \.
	exit 0
fi

if [ $1 = "help" ]; then
	echo " [version]\tgo\tcheckout to version\n"\
			"[version]\trm\tremove branch\n"
	exit 0
fi

if [ -z $ACTION ]; then
	git branch | grep \.
	exit 0
fi

if [ $ACTION = "rm" ]; then
	EXISTED=$(git branch | grep $ISSUE_NUM)
	echo "Remove ${ISSUE_NUM}"
	git branch -D "${ISSUE_NUM}"
	exit 0
fi

if [ $ACTION = "bump" ]; then
	node -e "var fs = require('fs');\
	var pkg = JSON.parse(fs.readFileSync('./package.json'));\
	console.log('bump version',pkg.version, '->','${ISSUE_NUM}');\
	pkg.version='${ISSUE_NUM}'; \
	fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2));"
	exit 0
fi

if [ $ACTION = "go" ]; then
	EXISTED=$(git branch | grep $ISSUE_NUM)
	if [ "$EXISTED" == "" ]; then
		echo "branch ${ISSUE_NUM} not exists, checkout -b"
		git checkout -b "${ISSUE_NUM}"
	else
		git checkout $(git branch | grep $ISSUE_NUM)
	fi
	exit 0
fi
