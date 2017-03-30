ISSUE_NUM=$1
ACTION=$2

if [ "$#" = 0 ]; then
	git branch | grep issue
	exit 0
fi

if [ $1 = "help" ]; then
	echo " [issue number]\tnv\tchange branch name to issue-XX-needs-verify\n"\
	 		"[issue number]\twip\tchange branch name to issue-XX-wip\n"\
	 		"[issue number]\tmg\tchange branch name to issue-XX-merged\n"\
	 		"[issue number]\trm\tremove branch\n"\
	 		"[issue number]\tadd\tadd branch issue-XX\n"
	exit 0
fi

if [ -z $ACTION ]; then
	git branch | grep $ISSUE_NUM
	exit 0
fi

if [ $ACTION = "add" ]; then
	git branch "issue-${ISSUE_NUM}"
	echo "Created branch ${TARGET_BRANCH_NAME}"
	exit 0
fi

if [ $ACTION = "go" ]; then
	EXISTED=$(git branch | grep $ISSUE_NUM)
	if [ "$EXISTED" == "" ]; then
		echo "branch issue-${ISSUE_NUM} not exists, checkout -b"
		git checkout -b "issue-${ISSUE_NUM}"
	else
		git checkout $(git branch | grep $ISSUE_NUM)
	fi
	exit 0
fi

TARGET_BRANCH_NAME="$(git branch | grep $1)"

if [ $ACTION = "rm" ]; then
	git branch -D $TARGET_BRANCH_NAME
	exit 0
fi


if [ $ACTION = "nv" ]; then
	NEW_NAME="issue-${ISSUE_NUM}-needs-verify"
elif [ $ACTION = "wip" ]; then
	NEW_NAME="issue-${ISSUE_NUM}-wip"
elif [ $ACTION = "mg" ]; then
	NEW_NAME="issue-${ISSUE_NUM}-merged"
fi

echo "Rename ${TARGET_BRANCH_NAME} to ${NEW_NAME}"
git branch -m ${TARGET_BRANCH_NAME} ${NEW_NAME}

git branch | grep issue
