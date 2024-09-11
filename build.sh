#!/bin/bash

# Ruta del directorio build
MAIN_DIR=$(pwd)
BUILD_DIR="$MAIN_DIR/build"
CIRCUITS_DIR="$MAIN_DIR/circuits"

# Comprobar si el directorio build existe
if [ ! -d "$BUILD_DIR" ]; then
    echo "Creating build directory..."
    mkdir "$BUILD_DIR"
    echo -e "\e[32m[OK]\e[0m Directory build created."
else
    echo -e "\e[33m[WARN]\e[0m Regenerating build directory."
    rm -rf "$BUILD_DIR"
    mkdir "$BUILD_DIR"
    echo -e "\e[32m[OK]\e[0m Directory build created."
fi

# Crear dentro de build los directorios r1cs y witness
echo "Creating r1cs and witness directories..."
mkdir "$BUILD_DIR/r1cs"
mkdir "$BUILD_DIR/witness"
echo -e "\e[32m[OK]\e[0m Directories r1cs and witness created."

# Compilar el proyecto
echo "Compiling project..."
cd "$BUILD_DIR"

for file in "$CIRCUITS_DIR"/*; do
    if [ -f "$file" ]; then
        echo "Compiling $file..."
        cd "$BUILD_DIR/r1cs"
        circom "$file" --r1cs -l "$MAIN_DIR"
        echo -e "\e[32m[OK]\e[0m Compiled $file"
        cd "$BUILD_DIR/witness"
        circom "$file" --wasm -l "$MAIN_DIR"
        echo -e "\e[32m[OK]\e[0m Created witness for $file"
    fi
done
