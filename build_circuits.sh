#!/bin/bash

# Ruta del directorio build
MAIN_DIR=$(pwd)
BUILD_DIR="$MAIN_DIR/circuits_build"
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
echo "Creating r1cs, witness and verification directories..."
mkdir "$BUILD_DIR/r1cs"
mkdir "$BUILD_DIR/witness"
mkdir "$BUILD_DIR/verification"
echo -e "\e[32m[OK]\e[0m Directories r1cs and witness created."

cd "$BUILD_DIR"

# Descargar el archivo powersOfTau28_hez_final_12.ptau
echo "Downloading powersOfTau28_hez_final_12.ptau..."
wget https://hermez.s3-eu-west-1.amazonaws.com/powersOfTau28_hez_final_12.ptau -
echo -e "\e[32m[OK]\e[0m Downloaded powersOfTau28_hez_final_12.ptau."


# Compilar el proyecto
echo "Compiling project..."
for file in "$CIRCUITS_DIR"/*; do
    if [ -f "$file" ]; then
        echo "Compiling $file..."
        cd "$BUILD_DIR/r1cs"
        circom "$file" --r1cs -l "$MAIN_DIR"
        echo -e "\e[32m[OK]\e[0m Compiled $(basename ${file})"

        cd "$BUILD_DIR/witness"
        circom "$file" --wasm -l "$MAIN_DIR"
        echo -e "\e[32m[OK]\e[0m Created witness for $(basename ${file})"
    fi
done

for file in "$BUILD_DIR/r1cs"/*; do
    if [ -f "$file" ]; then
        filename=$(basename ${file} | sed 's/\.r1cs//g' )
        echo "Creating verification file for $filename..."
        cd "$BUILD_DIR/verification"
        npx snarkjs groth16 setup $file ../powersOfTau28_hez_final_12.ptau "$filename".zkey
        echo "Creating verification JSON for $filename..."
        npx snarkjs zkey export verificationkey "$filename".zkey "$filename"_key.json
        echo -e "\e[32m[OK]\e[0m Created verification file for $(basename ${file})"
    fi
done

echo -e "\e[32m[OK]\e[0m Project compiled."


