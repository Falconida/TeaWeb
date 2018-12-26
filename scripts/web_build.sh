#!/usr/bin/env bash

BASEDIR=$(dirname "$0")
cd "$BASEDIR/../"
source ./scripts/resolve_commands.sh

if [ "$1" == "development" ] || [ "$1" == "dev" ]; then
    source_path="web/environment/development"
    type="development"
elif [ "$1" == "release" ] || [ "$1" == "rel" ]; then
    source_path="web/environment/release"
    type="release"
else
    if [ $# -lt 1 ]; then
        echo "Invalid argument count!"
    else
        echo "Invalid option $1"
    fi
    echo 'Available options are: "development" or "dev", "release" or "rel"'
    exit 1
fi

echo "Generating style files"
npm run compile-sass
if [ $? -ne 0 ]; then
    echo "Failed to generate style files"
    exit 1
fi

echo "Generating web workers"
npm run build-worker
if [ $? -ne 0 ]; then
    echo "Failed to build web workers"
    exit 1
fi

#Lets build some tools
#dtsgen should be already build by build_declarations.sh
./tools/build_trsgen.sh
if [ $? -ne 0 ]; then
    echo "Failed to build typescript translation generator"
    exit 1
fi

#Now lets build the declarations
echo "Building declarations"
./scripts/build_declarations.sh
if [ $? -ne 0 ]; then
    echo "Failed to generate declarations"
    exit 1
fi

if [ "$type" == "release" ]; then #Compile everything for release mode
    #Compile the shared source first
    echo "Building shared source"
    ./shared/generate_packed.sh
    if [ $? -ne 0 ]; then
        echo "Failed to build shared source"
        exit 1
    fi

    #Now compile the web client itself
    echo "Building web client"
    ./web/generate_packed.sh
    if [ $? -ne 0 ]; then
        echo "Failed to build web client"
        exit 1
    fi
elif [ "$type" == "development" ]; then
    echo "Building shared source"
    execute_ttsc -p ./shared/tsconfig/tsconfig.json
    if [ $? -ne 0 ]; then
        echo "Failed to compile shared sources"
        exit 1
    fi

    echo "Building web client source"
    execute_ttsc -p ./web/tsconfig/tsconfig.json
    if [ $? -ne 0 ]; then
        echo "Failed to compile web sources"
        exit 1
    fi
fi

echo "Generating environment"
php files.php generate web ${type}
if [ $? -ne 0 ]; then
    echo "Failed to generate environment"
    exit 1
fi

echo "Successfully build!"