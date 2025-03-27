 #!/bin/bash

CHANGED_FILES=$(git diff --cached --name-only --diff-filter=ACM); 
PKG_MGR=${PKG_MGR:-npm}

print_banner() {
    echo "========================================"
}

run_prettier() {
    # Only format files that have changed

    FILE_TO_FMT=$(cat $CHANGED_FILES | grep -E "\\.(js|ts|tsx|json|md)$");     

    if [ -z "$FILE_TO_FMT" ]; then
        echo "No files to format, skipping prettier"
        return
    fi

    echo "Files to format: $FILE_TO_FMT"

    if ! prettier --write $FILE_TO_FMT; then
        echo "ERROR: Prettier failed to run"
        print_banner
        exit 1
    fi
}

run_linter() {
    if ! $PKG_MGR run lint; then
        echo "ERROR: Linter failed. Please fix the linting errors and try again."
        print_banner
        exit 1
    fi
}

run_add_files() {
    git add $CHANGED_FILES
}

if [ -n "$CHANGED_FILES" ]; then 
   
    steps=(
        "run_prettier"
        "run_linter"
        "run_add_files"
    )

    idx=0
    total_steps=${#steps[@]}

    for step in "${steps[@]}"; do
        idx=$((idx + 1))

        print_banner
        echo "[$idx of $total_steps] $step"
        $step

    done
    print_banner

else 
    echo "WARN: No changes to commit, commit pipeline skipped"
fi 