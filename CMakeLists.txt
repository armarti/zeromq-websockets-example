cmake_minimum_required(VERSION 3.15)
cmake_policy(SET CMP0074 NEW)
project(desktop_app_template2)

### globals ####################################################################
set(CMAKE_CXX_STANDARD 17 CACHE STRING "" FORCE)
set(PROJ_CMAKE_DIR "${CMAKE_CURRENT_SOURCE_DIR}/cmake")
set(CMAKE_MODULE_PATH "${PROJ_CMAKE_DIR};${CMAKE_MODULE_PATH}")
add_definitions(-DMSGPACK_DEFAULT_API_VERSION=3)
add_compile_definitions(MSGPACK_DEFAULT_API_VERSION=3)
###############################################################################

### find packages #############################################################
find_package(Boost COMPONENTS system date_time thread chrono regex random REQUIRED)
export(PACKAGE Boost)
###############################################################################

### libzmq ####################################################################
# Need to build libzmq from master until this PR adding websockets is merged into a release:
# https://github.com/zeromq/libzmq/pull/3579
set(BUILD_STATIC ON CACHE BOOL "" FORCE)
set(BUILD_SHARED ON CACHE BOOL "" FORCE)
set(BUILD_TESTS OFF CACHE BOOL "" FORCE)
set(ZMQ_BUILD_TESTS OFF CACHE BOOL "" FORCE)
add_subdirectory(libzmq)
#get_target_property(ZeroMQ_LIBRARY_DIR libzmq BINARY_DIR)
#get_target_property(ZeroMQ_LIBRARIES libzmq OUTPUT_NAME)
#get_target_property(ZeroMQ_INCLUDE_DIRS libzmq INTERFACE_INCLUDE_DIRECTORIES)
#configure_file("${PROJ_CMAKE_DIR}/FindZeroMQ.cmake.in" "${PROJ_CMAKE_DIR}/FindZeroMQ.cmake" @ONLY)
###############################################################################

### cppzmq ####################################################################
set(CPPZMQ_BUILD_TESTS OFF CACHE BOOL "" FORCE)
add_subdirectory(cppzmq)
add_dependencies(cppzmq libzmq)
add_dependencies(cppzmq-static libzmq-static)
###############################################################################

### msgpack-c #################################################################
if(${CMAKE_CXX_STANDARD} EQUAL 17)
    set(MSGPACK_CXX11 ON CACHE BOOL "" FORCE)
    set(MSGPACK_CXX17 ON CACHE BOOL "" FORCE)
elseif(${CMAKE_CXX_STANDARD} EQUAL 14 OR ${CMAKE_CXX_STANDARD} EQUAL 11)
    set(MSGPACK_CXX11 ON CACHE BOOL "" FORCE)
    unset(MSGPACK_CXX17 CACHE)
else()
    unset(MSGPACK_CXX11 CACHE)
    unset(MSGPACK_CXX17 CACHE)
endif()
set(MSGPACK_ENABLE_SHARED ON CACHE BOOL "" FORCE)
set(MSGPACK_ENABLE_STATIC ON CACHE BOOL "" FORCE)
set(MSGPACK_BOOST ON CACHE BOOL "" FORCE)
set(MSGPACK_USE_X3_PARSE OFF CACHE BOOL "" FORCE)  # makes it use cpp14
set(MSGPACK_ENABLE_CXX ON CACHE BOOL "" FORCE)
set(MSGPACK_DEFAULT_API_VERSION "3" CACHE STRING "" FORCE)
set(MSGPACK_BUILD_EXAMPLES OFF CACHE BOOL "" FORCE)
set(MSGPACK_BUILD_TESTS OFF CACHE BOOL "" FORCE)
message("CMAKE_VERSION=${CMAKE_VERSION}")
# creates targets msgpackc-cxx msgpackc msgpackc-static example
add_subdirectory(msgpack-c)
###############################################################################

### main exe ##################################################################
add_executable(desktop_app_template2 src/cpp/main.cpp)
add_dependencies(desktop_app_template2 cppzmq msgpackc msgpackc-cxx)
target_link_directories(desktop_app_template2 BEFORE PUBLIC ${Boost_LIBRARY_DIRS})
target_link_libraries(desktop_app_template2
    PUBLIC cppzmq
    PUBLIC libzmq
    PUBLIC ${Boost_LIBRARIES}
    PUBLIC msgpackc
    PUBLIC msgpackc-cxx)
target_include_directories(desktop_app_template2 BEFORE
    PUBLIC cppzmq
    PUBLIC libzmq
    PUBLIC ${Boost_INCLUDE_DIRS}
    PUBLIC msgpackc
    PUBLIC msgpackc-cxx)
###############################################################################
