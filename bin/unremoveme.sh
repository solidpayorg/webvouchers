#!/bin/bash

for i in $(find ./src -name '*.jsx') 
  do
  if grep -q '//REMOVE $' $i ; then
    echo $i
    sed 's/\(.*\)\(\/\/REMOVE \)$/\2\1/' $i > /tmp/unremove
    mv /tmp/unremove $i
  else
    echo not found
  fi  
  done
