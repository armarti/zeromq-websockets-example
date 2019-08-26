set(ZeroMQ_LIBRARY_DIR $<TARGET_FILE_DIR:libzmq>)
set(ZeroMQ_LIBRARIES $<TARGET_FILE_BASE_NAME:libzmq>)
set(ZeroMQ_LIBRARY ${ZeroMQ_LIBRARIES})
set(ZeroMQ_INCLUDE_DIRS $<TARGET_PROPERTY:libzmq,INTERFACE_INCLUDE_DIRECTORIES>)

include(FindPackageHandleStandardArgs)
find_package_handle_standard_args(
    ZeroMQ
    DEFAULT_MSG
    ZeroMQ_LIBRARY_DIR
    ZeroMQ_LIBRARIES
    ZeroMQ_LIBRARY
    ZeroMQ_INCLUDE_DIRS
)
